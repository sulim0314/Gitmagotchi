package user.entity;

import collection.entity.Collection;
import common.entity.BaseEntity;
import lombok.Getter;
import org.joda.time.LocalDateTime;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter

@Table(name = "user")
public class User extends BaseEntity {
    @Id
    private Long id;
    private String profile_img;
    private String nickname;
    private String github_username;
    private Integer gold = 0;
    private Integer meal = 0;
    private LocalDateTime last_time = LocalDateTime.now();

    @OneToMany(mappedBy = "user")
    private List<Collection> collectionList = new ArrayList<>();
}