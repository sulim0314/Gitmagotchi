package user.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    private LocalDateTime lastTime = LocalDateTime.now();
    private Integer backgroundId;
    private Integer characterId;
}