import express from "express";
import { prisma } from "../utils/prisma.js";

const router = express.Router();

// 메뉴 개수, 주문 개수, 판매 금액 합계

router.get("/stats", async (req, res, next) => {
  try {
    //메뉴 개수
    const totalMenus = await prisma.menu.count();
    //주문 개수
    const totalOrders = await prisma.orderHistory.count();
    // 판매 금액 합계
    const orders = await prisma.orderHistory.findMany({
      include: {
        menu: true, // 메뉴 테이블 참조
      },
    });
    // for문 이용해 총 금액 합산
    let totalSales = 0;
    for (let i = 0; i < orders.length; i++) {
      totalSales += orders[i].menu.price;
    }

    res.status(200).json({
      stats: {
        totalMenus,
        totalOrders,
        totalSales,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "조회 실패." });
  }
});

/* router.get('/stats', (req, res, next) => {
  res.status(200).json({
      stats: {
          totalMenus: 3,
          totalOrders: 10,
          totalSales: 30000
      }
  });
}); */

// 메뉴 조회
router.get("/", async (req, res) => {
  try {
    const menu = await prisma.menu.findMany({
      include: {
        orders: true,
      },
    });
    // map을 이용해 각각의 요소를 호출해서 그 값을 변환
    const menus = menu.map((menu) => ({
      id: menu.id,
      name: menu.name,
      type: menu.type,
      temperature: menu.temperature,
      price: menu.price,
      totalOrders: menu.orders.length,
    }));

    // 배열 형식으로 응답 보내기
    res.status(200).json({ message: "메뉴 조회 완료!", menus: menus });
  } catch (error) {
    res.status(400).json({ message: "메뉴 조회 실패." });
  }
});

/* router.get("/", async (req, res, next) => {
  const list = await prisma.menu.findMany();
  res.status(200).json({
    menus: [
      {
        id: 1,
        name: "Latte",
        type: "Coffee",
        temperature: "hot",
        price: 4500,
        totalOrders: 5,
      },
      {
        id: 2,
        name: "Iced Tea",
        type: "Tea",
        temperature: "ice",
        price: 3000,
        totalOrders: 10,
      },
    ],
  });
}); */

// 메뉴 생성
router.post("/", async (req, res) => {
  try {
    const { name, type, temperature, price } = req.body;
    const menu = await prisma.menu.create({
      data: {
        name,
        type,
        temperature,
        price,
      },
    });
    res.status(200).json({ message: "메뉴 생성 완료!", menu });
  } catch (error) {
    res.status(400).json({ message: "메뉴 생성 실패." });
  }
});

// 메뉴 수정(patch이용)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, temperature, price } = req.body;

    const menu = await prisma.menu.update({
      where: {
        id: +id,
      },
      data: {
        name,
        type,
        temperature,
        price,
      },
    });

    res.status(200).json({ message: "메뉴 수정 완료!", menu });
  } catch (error) {
    res.status(400).json({ message: "메뉴 수정 실패." });
  }
});

// 메뉴 삭제
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await prisma.menu.delete({
      where: {
        id: +id,
      },
    });

    res.status(200).json({ message: "메뉴 삭제 완료!", menu });
  } catch (error) {
    res.status(400).json({ message: "메뉴 삭제 실패." });
  }
});

export default router;
