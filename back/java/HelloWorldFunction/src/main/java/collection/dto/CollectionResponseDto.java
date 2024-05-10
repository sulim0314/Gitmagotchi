package collection.dto;

import collection.enums.EndingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionResponseDto {

    private Integer id;
    private String characterName;
    private String ending;
    private Integer fullnessStat;  //포만감
    private Integer intimacyStat;  //친밀도
    private Integer cleannessStat; //청결도
    private String characterUrl;
}
