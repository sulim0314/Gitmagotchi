package collection.dto;

import collection.enums.EndingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import user.entity.User;

import javax.persistence.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionResponseDto {

    private Long id;
    private String character_name;
    private EndingType ending;
    private Integer fullness_stat;  //포만감
    private Integer intimacy_stat;  //친밀도
    private Integer cleanness_stat; //청결도
    private String character_url;
}
