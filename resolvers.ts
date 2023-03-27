import { Job, Company } from "./db";

function rejectIf(condition: Boolean) {
  if (condition) throw new Error("Unauthorized");
}

export const resolvers = {
  Query: {
    job: (_root, { id }) => Job.findById(id),
    jobs: () => Job.findAll(),
    company: (_root, { id }) => Company.findById(id),
  },
  Mutation: {
    createJob: async (_root, { input }, { user }) => {
      rejectIf(!user);
      return Job.create({ ...input, companyId: user.companyId });
    },
    deleteJob: async (_root, { id }, { user }) => {
      rejectIf(!user);
      const jobToDelete = await Job.findById(id);
      rejectIf(jobToDelete.companyId !== user.companyId);
      return Job.delete(id);
    },
    updateJob: async (_root, { input }, { user }) => {
      rejectIf(!user);
      const jobToUpate = await Job.findById(input.id);
      rejectIf(jobToUpate.companyId !== user.companyId);
      return Job.update({ ...input, companyId: user.companyId });
    },
  },
  Job: {
    company: (job) => Company.findById(job.companyId),
  },
  Company: {
    jobs: (company) => Job.findAll((job) => job.companyId === company.id),
  },
};
