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
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private EndingType ending;

    private String character_name;
    private Integer fullness_stat;  //포만감
    private Integer intimacy_stat;  //친밀도
    private Integer cleanness_stat; //청결도
    private String character_url;
}
