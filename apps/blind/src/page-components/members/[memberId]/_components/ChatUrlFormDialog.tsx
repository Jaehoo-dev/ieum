import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useForm } from "react-hook-form";

import { TextInput } from "~/components/form/TextInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (kakaoOpenchatUrl: string) => Promise<void>;
}

export function ChatUrlFormFormDialog({ open, onClose, onSubmit }: Props) {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = useForm({
    defaultValues: {
      value: "",
    },
  });

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
      fullWidth={true}
      maxWidth="xs"
    >
      <form
        onSubmit={handleSubmit(async ({ value }) => {
          await onSubmit(value);
        })}
      >
        <DialogTitle>오픈채팅방 링크</DialogTitle>
        <DialogContent>
          <DialogContentText>
            카카오톡 오픈채팅방을 생성해 링크를 입력해주세요. 링크와 함께
            상대방에게 성사 알림을 보냅니다.
          </DialogContentText>
          <div className="mt-4">
            <TextInput
              label="오픈채팅방 링크"
              placeholder="https://open.kakao.com/..."
              {...register("value", {
                required: true,
              })}
              error={errors.value != null}
              autoFocus={true}
              right={
                <button
                  type="button"
                  className="bg-white pl-1 text-sm text-blind-500 underline"
                  onClick={async () => {
                    const copiedText = await navigator.clipboard.readText();
                    setValue("value", copiedText);
                  }}
                >
                  붙여넣기
                </button>
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <div className="flex flex-row gap-2 px-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-8 py-2 text-gray-700 hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-md bg-blind-500 px-8 py-2 text-white hover:bg-blind-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "보내는 중.." : "하트 보내기"}
            </button>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
}
