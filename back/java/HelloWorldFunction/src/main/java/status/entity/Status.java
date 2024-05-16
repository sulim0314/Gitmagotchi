package status.entity;

import collection.entity.Collection;
import common.entity.BaseEntity;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "status")
public class Status extends BaseEntity {

    @Id
    @Column(name = "character_id")
    private Integer character_id;

    @Column(name = "user_id")
    private Integer user_id;

    private Integer fullness;
    private Integer intimacy;
    private Integer cleanness;

}