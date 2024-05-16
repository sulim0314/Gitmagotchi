package character.image.entity;

import common.entity.BaseEntity;
import lombok.Getter;
import software.amazon.awssdk.services.sts.endpoints.internal.Value.Int;
import user.entity.User;

import javax.persistence.*;
@Entity
@Getter
@Table(name = "`character`")
public class Characters extends BaseEntity {

    @Id
    private Integer id;

    private Integer user_id;
    private String name;
    private Integer exp;

    @Column(name = "face_url")
    private String faceUrl;

}