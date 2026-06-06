import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";

export async function register(phone: string, password: string, fullName: string, role: "PASSENGER" | "DRIVER" = "PASSENGER") {
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    throw new Error("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { phone, password: hash, fullName, role },
    select: { id: true, phone: true, fullName: true, role: true, createdAt: true }
  });

  // Agar driver ro'yxatdan o'tsa — Driver yozuvi yaratiladi
  if (role === "DRIVER") {
    await prisma.driver.create({ data: { userId: user.id } });
  }

  return user;
}

export async function login(phone: string, password: string) {
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    throw new Error("Foydalanuvchi topilmadi");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Noto'g'ri parol");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: { id: user.id, phone: user.phone, fullName: user.fullName, role: user.role }
  };
}

export async function me(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, phone: true, fullName: true, role: true, createdAt: true,
      driver: { select: { id: true, online: true, rating: true, latitude: true, longitude: true } }
    }
  });
}
