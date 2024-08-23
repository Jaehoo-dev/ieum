import { useState } from "react";
import ModeCommentRoundedIcon from "@mui/icons-material/ModeCommentRounded";

import { FeedbackFormDialog } from "./FeedbackFormDialog";

export function FeedbackButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-10 h-14 w-14 rounded-full bg-primary-500 p-4 shadow-lg hover:bg-primary-700"
        onClick={() => {
          setIsDialogOpen(true);
        }}
      >
        <ModeCommentRoundedIcon className="text-white" />
      </button>
      <FeedbackFormDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
      />
    </>
  );
}
