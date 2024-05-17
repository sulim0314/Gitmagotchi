import tw from "tailwind-styled-components";
import TrophyGoldImage from "@/assets/images/trophyGold.png";
import TrophySilverImage from "@/assets/images/trophySilver.png";
import TrophyBronzeImage from "@/assets/images/trophyBronze.png";
import { FaAward, FaSkull } from "react-icons/fa6";
import { IRanking } from "@/models";
import DefaultUserImage from "@/assets/images/defaultUser.svg";

interface IProps {
  rank: number;
  ranking: IRanking;
  best: boolean;
}

export default function RankingItem({ rank, best, ranking }: IProps) {
  return (
    <Wrapper>
      <RankContainer>
        <RankText>{rank}</RankText>
        {rank === 1 && (
          <img
            src={TrophyGoldImage}
            className="h-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {rank === 2 && (
          <img
            src={TrophySilverImage}
            className="h-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {rank === 3 && (
          <img
            src={TrophyBronzeImage}
            className="h-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        )}
      </RankContainer>
      <UserContainer>
        <img
          src={ranking.profileImg || DefaultUserImage}
          className="w-12 rounded-md shadow-md"
        />
        <UserDetailContainer>
          <GitHubUsername>{ranking.githubUsername}</GitHubUsername>
          <Nickname>{ranking.nickname}</Nickname>
        </UserDetailContainer>
      </UserContainer>
      <DetailContainer>
        {best ? <AwardIcon /> : <SkullIcon />}
        <DetailText>{ranking.collectionCount}</DetailText>
      </DetailContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-24
pr-4
flex
justify-between
border-b
border-slate-300
`;

const RankContainer = tw.div`
w-20
h-full
flex
justify-center
items-center
relative
`;

const RankText = tw.h1`
z-10
font-bold
`;

const UserContainer = tw.div`
w-20
flex-grow
flex
items-center
space-x-4
px-2
`;

const UserDetailContainer = tw.div`
flex
flex-col
space-y-1
`;

const GitHubUsername = tw.h4`
text-xs
`;

const Nickname = tw.h1`
font-semibold
text-lg
`;

const DetailContainer = tw.div`
w-16
h-full
flex
justify-center
items-center
space-x-2
`;

const AwardIcon = tw(FaAward)`
w-4
h-4
`;

const SkullIcon = tw(FaSkull)`
w-4
h-4
`;

const DetailText = tw.h3`
text-sm
font-semibold
`;
