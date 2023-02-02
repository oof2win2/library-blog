import { User } from "@prisma/client";
import { NextApiRequest } from "next";
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

type ApiRequestExtensions<Query, Body> = {
  populated: boolean;
  query: Query;
  body: Body;
} & (
  | {
      populated: false;
    }
  | {
      populated: true;
      //   sessionData: SessionDataType
      sessionData: null;
      user: User;
    }
);

export type ApiRequest<
  Query = Partial<{
    [key: string]: string | string[];
  }>,
  Body = any
> = NextApiRequest & ApiRequestExtensions<Query, Body>;
export type PopulatedApiRequest<
  Query = Partial<{
    [key: string]: string | string[];
  }>,
  Body = any
> = ApiRequest<Query, Body> & {
  populated: true;
};
