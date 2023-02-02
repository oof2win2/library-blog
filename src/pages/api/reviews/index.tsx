import { validate } from "@/middleware/apiValidation";
import { ApiRequest, ApiResponse, PopulatedApiRequest } from "@/utils/types";
import { NextApiResponse } from "next";
import nc from "next-connect";
import { GET_Query } from "./index.types";
import { db } from "@/utils/db";

const handler = nc<ApiRequest, NextApiResponse>();

handler.get<ApiRequest<GET_Query>>(
  validate({ query: GET_Query }),
  async (req, res) => {
    const { page, amountPerPage } = req.query;

    const reviews = await db.review.findMany({
      skip: page * amountPerPage,
      take: amountPerPage,
    });

    return res.status(200).json({ status: "success", reviews });
  }
);

export default handler;
