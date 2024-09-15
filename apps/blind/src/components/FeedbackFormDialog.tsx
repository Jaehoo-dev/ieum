import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useForm } from "react-hook-form";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { TextareaInput } from "./form/TextareaInput";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function FeedbackFormDialog({ open, onClose }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          paddingTop: "8px",
          paddingBottom: "12px",
        },
      }}
    >
      <Form
        onCancel={onClose}
        onSubmit={() => {
          onClose();
          alert("의견을 접수했습니다. 감사합니다.");
        }}
      />
    </Dialog>
  );
}

interface FormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

function Form({ onCancel, onSubmit }: FormProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      value: "",
    },
  });
  const { sendMessage } = useSlackNotibot();

  return (
    <form
      onSubmit={handleSubmit(async ({ value }) => {
        await sendMessage({
          channel: "피드백",
          content: value,
        });
        onSubmit();
      })}
    >
      <DialogTitle>의견 보내기</DialogTitle>
      <DialogContent>
        <DialogContentText>
          회원님의 소중한 의견을 들려주세요. 더 좋은 서비스를 만드는 데
          참고하겠습니다. 익명으로 제출됩니다.
        </DialogContentText>
        <div className="mt-4">
          <TextareaInput
            {...register("value", {
              required: "내용을 입력해주세요.",
            })}
            error={errors.value != null}
            autoFocus={true}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <div className="flex flex-row gap-2 px-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-gray-200 px-8 py-2 text-gray-700 hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            className="bg-blind-500 hover:bg-blind-600 rounded-md px-8 py-2 text-white"
          >
            제출
          </button>
        </div>
      </DialogActions>
    </form>
  );
}
