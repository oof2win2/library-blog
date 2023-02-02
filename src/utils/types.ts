import { User } from "@prisma/client";
import { NextApiRequest } from "next";
import { SessionData } from "./validators";
// import { SessionDataType } from "./validators"

export type ApiError = {
  statusCode: number;
  message: string;
  description: string;
};

export type ApiResponse<D> =
  | {
      status: "success";
      data: D;
    }
  | {
      status: "error";
      errors: ApiError[];
    };

type ApiRequestExtensions<Query> = {
  populated: boolean;
  query: Query;
} & (
  | {
      populated: false;
    }
  | {
      populated: true;
      sessionData: SessionData;
      user: User;
    }
);

export type ApiRequest<
  Query = Partial<{
    [key: string]: string | string[];
  }>
> = NextApiRequest & ApiRequestExtensions<Query>;
export type PopulatedApiRequest<
  Query = Partial<{
    [key: string]: string | string[];
  }>
> = ApiRequest<Query> & {
  populated: true;
};
