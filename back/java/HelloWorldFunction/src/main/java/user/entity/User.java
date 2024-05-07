package user.entity;

import collections.entity.Collections;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter

@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String profile_img;
    private String nickname;
    private String github_username;
    private Integer gold;
    private Integer meal;
    private Timestamp last_time;

    @OneToMany(mappedBy = "user")
    private List<Collections> collectionList = new ArrayList<>();

    public User() {}
}
