package collections.entity;

import lombok.Getter;
import lombok.Setter;
import org.joda.time.DateTime;
import user.entity.User;

import javax.persistence.*;

@Entity
@Getter
@Setter

@Table(name = "collections")
public class Collections {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    private Boolean ending;
    private Integer fullness_stat;  //포만감
    private Integer intimacy_stat;  //친밀도
    private Integer cleanness_stat; //청결도
    private String character_url;

    public Collections() {}
}
