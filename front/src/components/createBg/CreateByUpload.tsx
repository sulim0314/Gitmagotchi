import tw from "tailwind-styled-components";
import DefaultImage from "@/assets/images/defaultImage.png";
import CommonButton from "@/components/common/CommonButton";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadBackground } from "@/api/background";

interface IProps {
  setProcess: React.Dispatch<React.SetStateAction<number>>;
  setCreatedUrl: React.Dispatch<React.SetStateAction<string>>;
}

export default function CreateByUpload({ setProcess, setCreatedUrl }: IProps) {
  const [uploadImg, setUploadImg] = useState<string | null>(DefaultImage);
  const mutation = useMutation({
    mutationFn: uploadBackground,
    onSuccess: (data) => {
      setCreatedUrl(data.imageUrl);
      setProcess(3);
    },
    onError: (err) => console.log(err),
  });

  const generateBg = () => {
    mutation.mutate({
      body: JSON.stringify({
        userId: 1,
        backgroundImg: uploadImg,
      }),
    });
  };

  const onChangeProfileImg: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise<void>((resolve) => {
        reader.onload = () => {
          setUploadImg((reader.result as string) || null); // 파일의 컨텐츠
          resolve();
        };
      });
    }
  };

  return (
    <Wrapper>
      <UploadContainer htmlFor="file">
        <UploadImg src={uploadImg || DefaultImage} />
        <ImgInput
          type="file"
          name="file"
          id="file"
          accept="image/*"
          onChange={onChangeProfileImg}
        />
      </UploadContainer>
      <Content>
        <DesktopTitle>
          <Title>이미지를 업로드해주세요.</Title>
          <Description>배경 이미지는 해상도가 높을수록 좋아요.</Description>
        </DesktopTitle>
        <ButtonContainer>
          <CommonButton title={"업로드 (💰50)"} onClick={generateBg} />
        </ButtonContainer>
      </Content>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
lg:flex-row
lg:space-x-32
justify-center
items-center
`;

const UploadContainer = tw.label`
w-60
h-60
shadow-md
rounded-xl
border-2
border-slate-800
cursor-pointer
overflow-hidden
`;

const UploadImg = tw.img`
w-60
h-60
object-contain
bg-slate-200
`;

const ImgInput = tw.input`
hidden
`;

const Content = tw.div`
flex
flex-col
justify-center
items-center
space-y-4
h-80
`;

const DesktopTitle = tw.div`
flex
flex-col
items-center
space-y-4
`;

const Title = tw.h1`
font-medium
text-3xl
my-8
lg:mb-6
`;

const Description = tw.p`
text-base
text-slate-500
`;

const ButtonContainer = tw.div`
h-72
flex
flex-col
space-y-4
justify-center
items-center
`;
