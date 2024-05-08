package collection.dto;

import collection.enums.OrderBy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionRequestDto {

    private String keyword;
    private Boolean isCollection = false;   //캐릭터 도감인지 -> 헤더에서 사용자 정보 가져와야 함
    private Boolean isIndependent;  //독립 or 독립x or 전체
    private OrderBy orderBy;        //최신순 or 오래된순
}