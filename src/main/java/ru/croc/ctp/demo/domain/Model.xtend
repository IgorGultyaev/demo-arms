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
import ru.croc.ctp.jxfw.core.domain.meta.persistence.XFWOneToMany
import ru.croc.ctp.jxfw.core.domain.meta.persistence.XFWManyToOne
import ru.croc.ctp.jxfw.core.domain.meta.persistence.XFWOneToOne


import ru.croc.ctp.jxfw.core.domain.meta.persistence.XFWBasic

@XFWObject
@XFWElementLabel("Cотрудник")
@Table(name = "employee_table")
class Employee {
    @XFWElementLabel("Имя")
    String firstName

    @XFWElementLabel("Фамилия")
    String lastName

    @XFWElementLabel("Пользователь")
    @XFWManyToMany(fetch=FetchType.LAZY)
    Set<User> user

    @XFWElementLabel("уволен")
    boolean fired

//    @XFWElementLabel("Адрес")
//    @XFWOneToMany(fetch=FetchType.LAZY)
//    Address address


}


@XFWObject
@XFWElementLabel("Должность")
@Table(name = "post")
class Post {
    @XFWElementLabel ("Название должности")
    String postName
}

@XFWObject
@XFWElementLabel("Страна")
@Table(name = "country")
class Country {
    @XFWElementLabel ("Страна")
    String countryName

    @XFWElementLabel("Город")
    @XFWOneToMany(fetch=FetchType.LAZY)
    Set<City> city
}

@XFWObject
@XFWElementLabel("Город")
@Table(name = "city")
class City {
    @XFWElementLabel ("Город")
    String cityName

    @XFWElementLabel("Страна")
    @XFWManyToOne(fetch=FetchType.LAZY)
    Country country

    @XFWElementLabel("Адрес")
    @XFWOneToMany(fetch=FetchType.LAZY)
    Set<Address> address

}


@XFWObject
@XFWElementLabel("Адрес")
@Table(name = "address")
class Address {

    @XFWElementLabel ("адрес")
    String addressName

    @XFWElementLabel("Город")
    @XFWManyToOne(fetch=FetchType.LAZY)
    City city

    @XFWElementLabel("Сотрудник")
    @XFWManyToOne(fetch=FetchType.LAZY)
    Employee employee
}


//Film Company

@XFWObject
@XFWElementLabel("Кинокомпания")
@Table(name = "filmCompany")
class FilmCompany {

    @XFWElementLabel ("Кинокомпания")
    String filmCompany
}

@XFWObject
@XFWElementLabel("Фильм")
@Table(name = "film")
class Film {

    @XFWElementLabel ("Фильм")
    String filmName

    @XFWElementLabel("Сотрудник")
    @XFWManyToMany(fetch=FetchType.LAZY)
    Set <Employee> employee

    @XFWElementLabel("Кинокомпания")
    @XFWManyToOne(fetch=FetchType.LAZY)
    FilmCompany filmCompany
}




@XFWObject
@XFWElementLabel("Пользователь")
@Table(name = "user_table")
class User {

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

