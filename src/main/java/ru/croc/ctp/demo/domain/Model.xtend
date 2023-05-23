package ru.croc.ctp.demo.domain

import java.sql.Blob
import java.time.LocalDateTime
import java.util.EnumSet
import java.util.Set
import javax.persistence.FetchType
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.Table

import static extension javax.persistence.FetchType.*
import ru.croc.ctp.jxfw.core.generator.meta.XFWObject
import ru.croc.ctp.jxfw.core.domain.meta.XFWElementLabel
import ru.croc.ctp.jxfw.core.domain.meta.XFWContentType
import ru.croc.ctp.jxfw.core.domain.meta.XFWEnumId;
import ru.croc.ctp.jxfw.core.generator.meta.XFWEnum
import ru.croc.ctp.jxfw.core.generator.meta.XFWProtected
import ru.croc.ctp.jxfw.core.domain.meta.persistence.XFWManyToMany
import ru.croc.ctp.jxfw.core.domain.meta.persistence.XFWBasic

@XFWObject
@XFWElementLabel("Пользователь")
@Table(name = "user_table")
class User {

    @XFWElementLabel("Имя")
    String firstName

    @XFWElementLabel("Фамилия")
    String lastName

    @XFWElementLabel("Логин")
    String login

	@XFWElementLabel("Роль")
    EnumSet<UserRole> role

    @XFWElementLabel("Фото")
    @XFWContentType("image")
    Blob avatar

    @XFWElementLabel("Пароль")
    @XFWProtected
    String password

    @XFWElementLabel("Дата создания")
    LocalDateTime created

    @XFWElementLabel("Дата последниего входа")
    LocalDateTime lastLogin

    @XFWElementLabel("Группы")
    @XFWManyToMany(fetch=FetchType.LAZY)
    Set<Group> groups
}

@XFWObject
@XFWElementLabel("Группа")
@Table(name = "group_table")
class Group {
    @XFWElementLabel("Наименование")
    @XFWBasic(optional = false)
    String name=""

	@XFWElementLabel("Члены группы")
    @XFWManyToMany(fetch=FetchType.LAZY)
    @JoinTable(name = "user_group",
    	joinColumns = @JoinColumn(name = "gid"),
    	inverseJoinColumns = @JoinColumn(name = "uid"))
    Set<User> users

    @XFWElementLabel("Роли")
    EnumSet<UserRole> roles
}



@XFWEnum
enum UserRole {

    @XFWElementLabel("Администратор")
    @XFWEnumId(2)
    Admin,
    @XFWElementLabel("Пользователь")
    @XFWEnumId(4)
    User
}