import type { ConfirmOptions } from "material-ui-confirm";
import { useConfirm } from "material-ui-confirm";

interface Options extends Omit<ConfirmOptions, "allowClose"> {
  title: string;
}

export function useConfirmDialog() {
  const confirm = useConfirm();

  const open = async ({
    dialogProps,
    cancellationButtonProps,
    confirmationButtonProps,
    ...options
  }: Options) => {
    try {
      await confirm({
        allowClose: false,
        cancellationText: "취소",
        confirmationText: "확인",
        dialogProps: {
          maxWidth: "xs",
          ...dialogProps,
        },
        cancellationButtonProps: {
          className: "bg-gray-500 text-white hover:bg-gray-600 flex-1 rounded",
          disableRipple: true,
          ...cancellationButtonProps,
        },
        confirmationButtonProps: {
          className:
            "bg-blind-500 text-white hover:bg-blind-600 flex-1 rounded",
          disableRipple: true,
          ...confirmationButtonProps,
        },
        ...options,
      });

      return true;
    } catch (err) {
      if (err != null) {
        throw err;
      }

      return false;
    }
  };

  return {
    open,
  };
}
