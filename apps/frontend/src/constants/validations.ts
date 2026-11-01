export const COMMENT_MAX_LENGTH = 1000;

export const VALIDATION_MESSAGES = {
  clientRequired: "Client selection is required.",
  projectRequired: "Project selection is required.",
  taskRequired: "Task selection is required.",
  startRequired: "Start date and time are required.",
  endRequired: "End date and time are required.",
  endAfterStart: "End must be after start.",
  commentRequired: "Comment is required.",
  commentTooLong: `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer.`,
};
