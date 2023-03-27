import { Database } from "fakebase";

const db = new Database("./data");

type Company = {
  id: string;
  name: string;
  description: string;
};

type Job = {
  id: string;
  companyId: string;
  title: string;
  description: string;
};

type User = {
  id: string;
  email: string;
  password: string;
  companyId: string;
};

export const Company = db.table<Company>("companies");
export const Job = db.table<Job>("jobs");
export const User = db.table<User>("users");
