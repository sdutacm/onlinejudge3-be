## 3.0.0.201812310

```sql
create table tag
(
	tag_id int auto_increment,
	name_en varchar(32) default '' not null,
	name_zh_hans varchar(32) default '' not null,
	name_zh_hant varchar(32) default '' not null,
	constraint tag_pk
		primary key (tag_id)
);

create table problem_tag
(
	problem_id int not null,
	tag_id int not null,
	constraint problem_tag_pk
		primary key (problem_id, tag_id)
);

alter table tag
	add hidden boolean default false not null;

alter table tag
	add created_at datetime not null;

alter table contest
	add frozen_length int default 0 not null;

alter table contest
	add is_ended boolean default false not null;

alter table user
	add banner_image varchar(256) default '' not null;

alter table user
	add settings text not null;

alter table contest_user
	add unofficial boolean default false not null;

alter table contest_user
	add subname varchar(64) default '' not null;

alter table contest_user
	add avatar varchar(256) default '' not null;

create table user_contest
(
	user_id int not null,
	contest_id int not null,
	createdAt datetime not null,
	constraint user_contest_pk
		primary key (user_id, contest_id)
);

alter table user
	add coin int default 0 not null;

alter table contest
	add intro mediumtext not null;

alter table solution
	add shared boolean default false not null;

```

## 3.0.0.201901140

```sql
alter table problem
	add difficulty int default 0 not null;

alter table user
	add rating int default 0 not null;

alter table user
	add rating_history mediumtext not null;

create table favorite
(
	favorite_id int auto_increment,
	user_id int default 0 not null,
	type varchar(64) default '' not null,
	target text not null,
	note text not null,
	created_at datetime not null,
	updated_at datetime not null,
	deleted boolean default false not null,
	constraint favorite_pk
		primary key (favorite_id)
);

```

## 3.0.0.201901280

```sql
alter table message
	add anonymous boolean default false not null;

```

## 3.0.0.201902110

```sql
create table `set`
(
	set_id int auto_increment,
	title varchar(128) default '' not null,
	description mediumtext not null,
	type varchar(32) default '' not null,
	props mediumtext not null,
	start_at datetime not null,
	end_at datetime not null,
	created_at datetime not null,
	updated_at datetime not null,
	hidden boolean default false not null,
	constraint set_pk
		primary key (set_id)
);
```

## 3.0.0.201903110

```sql
create table note
(
	note_id int auto_increment,
	user_id int default 0 not null,
	type varchar(64) default '' not null,
	target text not null,
	content text not null,
	created_at datetime not null,
	updated_at datetime not null,
	deleted boolean default false not null,
	constraint note_pk
		primary key (note_id)
);
```

## 3.0.1

```sql
alter table user
	add verified boolean default false not null after email;
```

## 3.1.0

```sql
create table rating_contest
(
	rating_contest_id INT auto_increment,
	contest_id INT not null,
	rating_until LONGTEXT not null,
	rating_change MEDIUMTEXT not null,
	created_at DATETIME not null,
	updated_at DATETIME not null,
	constraint rating_contest_pk
		primary key (rating_contest_id)
);

create unique index rating_contest_contest_id_uindex
	on rating_contest (contest_id);

alter table contest
	add mode tinyint default 0 null;

```

## 3.2.0

```sql
create table `group`
(
	group_id int auto_increment,
	name varchar(64) default '' not null,
	avatar varchar(64) default '' not null,
	intro text not null,
	verified boolean default false not null,
	private boolean default false not null,
	join_channel tinyint default 0 not null,
	members_count int default 0 not null,
	deleted boolean default false not null,
	created_at datetime not null,
	updated_at datetime not null,
	constraint group_pk
		primary key (group_id)
);

create table group_member
(
	group_member_id int auto_increment,
	group_id int not null,
	user_id int not null,
	permission tinyint default 0 not null,
	status tinyint default 0 not null,
	joined_at datetime not null,
	constraint group_member_pk
		primary key (group_member_id)
);

alter table `set`
	add created_by int default 0 not null;

alter table `set` drop column start_at;

alter table `set` drop column end_at;

```

## 2020-06-20 (be only)

```sql
alter table user_contest drop column createdAt;

```

## 2020-07-03

```sql
alter table solution
	add is_contest_user boolean default false not null;

```

## 2020-07-19

```sql
alter table topic add deleted boolean default false not null;
alter table reply add deleted boolean default false not null;

```

## 2021-02-12

```sql
create table judge_info
(
	id int auto_increment,
	solution_id int not null,
	last_case int default 0 not null,
	total_case int default 0 not null,
	detail text not null, # json
	finished_at datetime not null,
	constraint judge_info_pk
		primary key (id)
);

create unique index judge_info_solution_id_uindex
	on judge_info (solution_id);

```

## 2021-02-18

```sql
create index language
	on solution (pro_lang);

```

## 2022-02-07

```sql
create table user_permission
(
	user_id int not null,
	permission varchar(128) not null,
	constraint user_permission_pk
		primary key (user_id, permission)
);

```

## 2022-04-05

```sql
create table field
(
    field_id            int auto_increment
        primary key,
    name                varchar(64) default '' not null,
    short_name          varchar(16) default '' not null,
    seating_arrangement mediumtext  default '' not null,
    deleted             tinyint(1)  default 0  not null,
    created_at          datetime               not null,
    updated_at          datetime               not null,
    constraint field_name_uindex
        unique (name),
    constraint field_short_name_uindex
        unique (short_name)
);

```

## 2023-07-30

```sql
alter table problem
    add samples mediumtext default null comment 'JSON format sample array';

alter table problem
    add authors varchar(256) default '' not null comment 'JSON format author array';

```

## 2023-10

```sql
alter table problem add sp_config mediumtext default null comment 'JSON format object';

```

## 2023-12-07

```sql
alter table competition add rule varchar(64) default '' not null comment 'rule preset' after ended;
alter table competition add is_rating bool default false not null after is_team;
alter table competition add announcement longtext null after introduction;
alter table competition_setting add allowed_join_methods varchar(256) default '' not null comment 'array format: A,B,C' after frozen_length;
alter table competition_setting add allow_any_observation bool default false not null comment 'whether anyone is allowed to observe' after allowed_solution_languages;
alter table competition_setting add use_onetime_password bool default false not null comment 'whether to clear participant password after logged in' after allow_any_observation;
alter table competition_setting add join_password varchar(32) default '' not null after use_onetime_password;
alter table competition_problem add score int null;
alter table competition_problem add var_score_expression text default null;
alter table rating_contest add competition_id int null after contest_id;
alter table rating_contest drop key rating_contest_contest_id_uindex;
alter table rating_contest modify contest_id int null;

```

## utf8mb4

```sql
ALTER DATABASE oj CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

ALTER TABLE `collect_pro` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `college` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `concern` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `contest` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `contest_pro` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `favorite` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `grade` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `grade_detail` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `log` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `major` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `menu` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `message` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `news` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `note` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `pre_user` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `problem` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `problem_tag` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `queue` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `reply` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `session` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `set` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `tag` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `topic` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `user_contest` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `viewcode` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `contest_user` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `solution` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `code` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `compile_info` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

```

## 202401 for genshin

```sql
alter table competition add sp_config mediumtext default null comment 'JSON format object' after deleted;
alter table competition_problem add alias varchar(16) default '' not null comment 'alias for short' after `index`;
alter table competition_log modify action varchar(64) default '' not null;
create index competition_log_competition_id_action_index on competition_log (competition_id, action);
create index competition_log_competition_id_op_user_id_action_index on competition_log (competition_id, op_user_id, action);
```

## 202402 judger refactor

```sql
alter table judge_info add result int default 0 not null after solution_id;
alter table judge_info add take_time int default 0 not null after result;
alter table judge_info add take_memory int default 0 not null after take_time;
alter table judge_info add created_at datetime null after detail;
alter table judge_info modify finished_at datetime null;
alter table judge_info drop key judge_info_solution_id_uindex;
alter table solution add judge_info_id int null after competition_id;
```

## 202402 upgrade mysql 8.0

```sql
alter table solution alter column finished set default 0;
alter table user modify last_time datetime null;
alter table user alter column face_lang set default '';
alter table problem alter column accept set default 0;
alter table problem alter column submit set default 0;
alter table problem alter column submit_user_num set default 0;
alter table problem alter column accepted_user_num set default 0;
alter table problem alter column is_run_contest set default 0;
alter table problem alter column is_special_judge set default 0;
alter table user modify last_ip varchar(40) default '' not null;
alter table solution modify sub_ip varchar(40) default '' not null;
alter table contest alter column is_valid set default 0;
alter table contest alter column contest_author set default 0;
alter table contest alter column is_diy set default 0;
alter table contest alter column con_password set default '';
alter table message alter column from_user set default 0;
alter table message alter column mes_title set default '';
alter table message alter column from_delete set default 0;
alter table message alter column to_delete set default 0;
```

## for problem and judger agent upgrade

```sql
alter table problem add revision int default 1 not null;
alter table judge_info add problem_revision int null;
alter table judge_info modify problem_revision int null after solution_id;

alter table problem_tag add hidden tinyint(1) default 0 not null;
alter table problem_tag add created_at datetime not null;
```

## 202405 competition event

```sql
create table competition_event
(
    competition_event_id int auto_increment,
    competition_id       int                                       not null,
    event                varchar(64)                               not null,
    detail               text                                      null comment 'JSON',
    user_id              int                                       null,
    problem_id           int                                       null,
    solution_id          int                                       null,
    judge_info_id        int                                       null,
    created_at           TIMESTAMP(6) default CURRENT_TIMESTAMP(6) not null,
    constraint competition_event_pk primary key (competition_event_id)
);

create index competition_event_competition_id_event_index on competition_event (competition_id, event);
```

## 202408 achievement

```sql
create table user_achievement
(
    user_achievement_id int auto_increment,
    user_id             int                      not null,
    achievement_key     varchar(64)              not null,
    status              int          default 0   not null,
    created_at          datetime                 not null,
    constraint user_achievement_pk primary key (user_achievement_id)
);

create index user_achievement_user_id_index on user_achievement (user_id);
create index user_achievement_achievement_key_index on user_achievement (achievement_key);

alter table competition_log modify user_agent varchar(512) default '' not null;
```

## 202412 team

```sql
alter table user add type int default 1 not null;
alter table user add status int default 0 not null;

create table user_member
(
    user_id        int           not null,
    member_user_id int           not null,
    status         int default 0 not null,
    created_at     datetime      not null,
    updated_at     datetime      not null,
    constraint user_member_pk
        primary key (user_id, member_user_id)
);

create index user_member_user_id_member_user_id_status_index on user_member (user_id, member_user_id, status);
```

## 202412 static_object

```sql
create table static_object
(
    `key`      varchar(64)            not null,
    category   varchar(64) default '' not null,
    user_id    int                    null,
    mime       varchar(32) default '' not null,
    content    mediumtext             null,
    created_at datetime               not null,
    updated_at datetime               not null,
    constraint static_object_pk
        primary key (`key`)
);

create index static_object_category_index on static_object (category);
create index static_object_category_user_id_index on static_object (category, user_id);
create index static_object_user_id_index on static_object (user_id);
alter table static_object add view_count int default 0 not null after content;
```

## 202605 ai problem difficulty&tag

```sql
ALTER TABLE `problem_tag`
  ADD COLUMN `is_aigc` tinyint(1) NOT NULL DEFAULT 0 AFTER `tag_id`,
  ADD COLUMN `ai_author` varchar(32) NOT NULL DEFAULT '' AFTER `is_aigc`;

ALTER TABLE `problem`
  ADD COLUMN `difficulty_aigc` int(11) NOT NULL DEFAULT 0 COMMENT 'AI recognized difficulty' AFTER `difficulty`,
  ADD COLUMN `difficulty_ai_author` varchar(32) NOT NULL DEFAULT '' AFTER `difficulty_aigc`;
```
