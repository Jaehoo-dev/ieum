import { ReactElement, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@ieum/supabase";
import { assert } from "@ieum/utils";
import AddIcon from "@mui/icons-material/Add";
import { nanoid } from "nanoid";
import { Controller, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

interface VerificationForm {
  idBucketPaths: string[];
  jobBucketPaths: string[];
}

export function VerificationPage() {
  const router = useRouter();
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<VerificationForm>({
    defaultValues: {
      idBucketPaths: [],
      jobBucketPaths: [],
    },
  });
  const { mutateAsync: registerMany } =
    api.verificationRouter.registerMany.useMutation();

  return (
    <div className="flex w-full flex-col gap-4 text-gray-800">
      <div className="flex w-full items-start gap-1">
        <p className="text-sm text-gray-600">※</p>
        <p className="text-sm text-gray-600">
          모든 인증자료는 확인 후 즉시{" "}
          <span className="font-medium text-red-500">파기</span>합니다.
        </p>
      </div>
      <hr />
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(async ({ idBucketPaths, jobBucketPaths }) => {
          await registerMany({
            memberId: member.id,
            bucketPaths: [...idBucketPaths, ...jobBucketPaths],
          });

          alert("인증 자료를 제출했습니다.");

          router.replace("/settings");
        })}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">신분 인증</h2>
          <span className="mb-2 text-sm text-gray-700">
            성별과 실명, 나이를 인증할 수 있는 신분증(주민등록증, 운전면허증,
            여권 등)을 올려주세요.
          </span>
          <Controller
            control={control}
            name="idBucketPaths"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <ImageField
                  bucketPaths={value}
                  onUpload={(bucketPath) => {
                    onChange([...value, bucketPath]);
                  }}
                  onRemove={(bucketPath) => {
                    onChange(
                      value.filter((path) => {
                        return path !== bucketPath;
                      }),
                    );
                  }}
                  error={error != null}
                  errorText={error?.message}
                />
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">직장 인증</h2>
          <span className="mb-2 text-sm text-gray-700">
            직장을 인증할 수 있는 자료(재직증명서, 건강보험자격득실확인서, 명함,
            사업자등록증 등)를 올려주세요.
          </span>
          <Controller
            control={control}
            name="jobBucketPaths"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <ImageField
                  bucketPaths={value}
                  onUpload={(bucketPath) => {
                    onChange([...value, bucketPath]);
                  }}
                  onRemove={(bucketPath) => {
                    onChange(
                      value.filter((path) => {
                        return path !== bucketPath;
                      }),
                    );
                  }}
                  error={error != null}
                  errorText={error?.message}
                />
              );
            }}
          />
        </div>
        <button
          className="flex-1 rounded-lg bg-blind-500 px-4 py-2 text-lg font-medium text-white hover:bg-blind-700 disabled:opacity-50"
          type="submit"
          disabled={
            isSubmitting ||
            (watch("idBucketPaths").length === 0 &&
              watch("jobBucketPaths").length === 0)
          }
        >
          제출
        </button>
      </form>
    </div>
  );
}

interface ImageFieldProps {
  bucketPaths: string[];
  onUpload: (bucketPath: string) => void;
  onRemove: (bucketPath: string) => void;
  error: boolean;
  errorText?: string;
}

function ImageField({ bucketPaths, onUpload, onRemove }: ImageFieldProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {bucketPaths.map((bucketPath) => {
        return (
          <Image key={bucketPath} bucketPath={bucketPath} onRemove={onRemove} />
        );
      })}
      <ImageUploader onUpload={onUpload} />
    </div>
  );
}

interface ImageProps {
  bucketPath: string;
  onRemove: (bucketPath: string) => void;
}

function Image({ bucketPath, onRemove }: ImageProps) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(
      process.env
        .NEXT_PUBLIC_SUPABASE_BLIND_VERIFICATION_DOCUMENTS_BUCKET_NAME!,
    )
    .getPublicUrl(bucketPath);

  return (
    <div key={bucketPath} className="relative">
      <img
        className="w-full rounded-lg object-cover"
        src={publicUrl}
        alt="사진"
      />
      <button
        type="button"
        className="absolute right-2 top-2 rounded-full bg-white p-1"
        onClick={async () => {
          const { error } = await supabase.storage
            .from(
              process.env
                .NEXT_PUBLIC_SUPABASE_BLIND_VERIFICATION_DOCUMENTS_BUCKET_NAME!,
            )
            .remove([bucketPath]);

          assert(error == null, error?.message);

          onRemove(bucketPath);
        }}
      >
        <svg
          className="h-4 w-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

interface ImageUploaderProps {
  onUpload: (bucketPath: string) => void;
}

function ImageUploader({ onUpload }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={async (event) => {
          const file = event.target.files?.[0];

          if (file == null) {
            return;
          }

          const { data, error } = await supabase.storage
            .from(
              process.env
                .NEXT_PUBLIC_SUPABASE_BLIND_VERIFICATION_DOCUMENTS_BUCKET_NAME!,
            )
            .upload(nanoid(), file);

          assert(error == null, error?.message);

          onUpload(data.path);

          inputRef.current!.value = "";
        }}
        className="hidden"
      />
      <button
        className="flex h-40 items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300"
        type="button"
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        <AddIcon className="text-gray-600" fontSize="large" />
      </button>
    </>
  );
}

VerificationPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="인증">{page}</Layout>;
};
