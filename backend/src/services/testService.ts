import { ApiError } from "../utils/ApiError";
import { createTest, findTestById, listTests, countTests, updateTest, deleteTest } from "../repository/testRepository";
import { getPagination } from "../utils/pagination";

export const createTestService = async (payload: any) => {
  return createTest(payload);
};

export const getTestById = async (id: string) => {
  const test = await findTestById(id);
  if (!test) throw new ApiError(404, "Test not found");
  return test;
};

export const listTestsService = async (query: any) => {
  const { page, limit, skip } = getPagination(Number(query.page), Number(query.limit));
  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.subject) filter.subject = query.subject;
  const sort = query.sort ? { [query.sort.split(":")[0]]: query.sort.split(":")[1] === "desc" ? -1 : 1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    listTests(filter, skip, limit, sort),
    countTests(filter)
  ]);
  return { items, total, page, limit };
};

export const updateTestService = async (id: string, payload: any) => {
  const test = await updateTest(id, payload);
  if (!test) throw new ApiError(404, "Test not found");
  return test;
};

export const deleteTestService = async (id: string) => {
  const test = await deleteTest(id);
  if (!test) throw new ApiError(404, "Test not found");
  return test;
};
