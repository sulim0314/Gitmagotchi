package collection.entity;

import collection.enums.EndingType;
import common.entity.BaseEntity;
import lombok.Getter;
import user.entity.User;

import javax.persistence.*;

@Entity
@Getter
@Table(name = "collection")
public class Collection extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private EndingType ending;

    @Column(name = "character_name")
    private String characterName;
    @Column(name = "fullness_stat")
    private Integer fullnessStat;  //포만감
    @Column(name = "intimacy_stat")
    private Integer intimacyStat;  //친밀도
    @Column(name = "cleanness_stat")
    private Integer cleannessStat; //청결도
    @Column(name = "character_url")
    private String characterUrl;
}