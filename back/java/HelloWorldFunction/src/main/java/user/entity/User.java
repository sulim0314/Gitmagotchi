package user.entity;

import collections.entity.Collections;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String profile_img;
    private String nickname;
    private String github_username;
    private Integer gold = 0;
    private Integer meal = 0;
    private LocalDateTime last_time = LocalDateTime.now();
    private String github_token;

    @OneToMany(mappedBy = "user")
    private List<Collections> collectionList = new ArrayList<>();

}