package user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Integer id;
    private String profileImg;
    private String nickname;
    private String githubToken;
    private String githubUsername;
    private Integer gold = 0;
    private Integer meal = 0;
    private Integer backgroundId;
    private Integer characterId;
}