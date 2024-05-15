package character.image.entity;

import common.entity.BaseEntity;
import lombok.Getter;
import user.entity.User;

import javax.persistence.*;

@Entity
@Getter
@Table(name = "character")
public class Character extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String name;
    private Integer exp;

    @Column(name = "face_url")
    private String faceUrl;
    @Column(name = "character_url")
    private String characterUrl;
    @Column(name = "character_child_url")
    private String characterChildUrl;
    @Column(name = "character_adult_url")
    private String characterAdultUrl;
    @Column(name = "last_online")
    private String lastOnline;
}