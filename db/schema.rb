# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160430163344) do

  create_table "blog_posts", force: :cascade do |t|
    t.string   "title",        limit: 255
    t.text     "body",         limit: 65535
    t.date     "publish_date"
    t.integer  "blog_id",      limit: 4
    t.integer  "user_id",      limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "blog_posts", ["blog_id"], name: "index_blog_posts_on_blog_id", using: :btree
  add_index "blog_posts", ["user_id"], name: "index_blog_posts_on_user_id", using: :btree

  create_table "blogs", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "creator_id",  limit: 4
  end

  create_table "departments", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  create_table "email_to_sms_gateways", force: :cascade do |t|
    t.string   "name",        limit: 255,                  null: false
    t.string   "address",     limit: 255,                  null: false
    t.text     "description", limit: 65535
    t.boolean  "active",      limit: 1,     default: true, null: false
    t.datetime "created_at",                               null: false
    t.datetime "updated_at",                               null: false
  end

  create_table "issue_status_types", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.string   "code",        limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "alive",       limit: 1
  end

  create_table "issue_types", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code",        limit: 255
  end

  create_table "issues", force: :cascade do |t|
    t.string   "title",                       limit: 255
    t.text     "description",                 limit: 65535
    t.integer  "requestor_id",                limit: 4
    t.integer  "product_id",                  limit: 4
    t.integer  "issue_status_type_id",        limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "submitter_email",             limit: 255
    t.string   "submitter_full_name",         limit: 255
    t.integer  "issue_type_id",               limit: 4
    t.boolean  "accepted",                    limit: 1
    t.integer  "story_id",                    limit: 4
    t.string   "vendor_case_id",              limit: 255
    t.string   "vendor_issue_id",             limit: 255
    t.datetime "reported_to_vendor_at"
    t.integer  "slas_id",                     limit: 4
    t.datetime "vendor_response_due_at"
    t.datetime "vendor_response_actual_at"
    t.datetime "vendor_workaround_due_at"
    t.datetime "vendor_workaround_actual_at"
    t.datetime "vendor_solution_due_at"
    t.datetime "vendor_solution_actual_at"
    t.text     "impact",                      limit: 65535
  end

  add_index "issues", ["issue_status_type_id"], name: "index_issues_on_issue_status_type_id", using: :btree
  add_index "issues", ["issue_type_id"], name: "index_issues_on_issue_type_id", using: :btree
  add_index "issues", ["product_id"], name: "index_issues_on_product_id", using: :btree
  add_index "issues", ["slas_id"], name: "index_issues_on_slas_id", using: :btree
  add_index "issues", ["story_id"], name: "index_issues_on_story_id", using: :btree

  create_table "meeting_assignments", force: :cascade do |t|
    t.integer  "meeting_id", limit: 4
    t.integer  "user_id",    limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
  end

  add_index "meeting_assignments", ["meeting_id"], name: "index_meeting_assignments_on_meeting_id", using: :btree
  add_index "meeting_assignments", ["user_id"], name: "index_meeting_assignments_on_user_id", using: :btree

  create_table "meetings", force: :cascade do |t|
    t.datetime "scheduled"
    t.string   "title",       limit: 255
    t.string   "subject",     limit: 255
    t.text     "description", limit: 65535
    t.text     "notes",       limit: 65535
    t.integer  "creator_id",  limit: 4
    t.integer  "owner_id",    limit: 4
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.integer  "product_id",  limit: 4
    t.integer  "project_id",  limit: 4
  end

  add_index "meetings", ["creator_id"], name: "index_meetings_on_creator_id", using: :btree
  add_index "meetings", ["owner_id"], name: "index_meetings_on_owner_id", using: :btree
  add_index "meetings", ["product_id"], name: "index_meetings_on_product_id", using: :btree
  add_index "meetings", ["project_id"], name: "index_meetings_on_project_id", using: :btree

  create_table "note_privacy_types", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.string   "code",        limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "notes", force: :cascade do |t|
    t.string   "title",                limit: 255
    t.text     "body",                 limit: 65535
    t.integer  "creator_id",           limit: 4
    t.integer  "note_privacy_type_id", limit: 4,     default: 1, null: false
    t.integer  "product_id",           limit: 4
    t.integer  "sprint_id",            limit: 4
    t.integer  "story_id",             limit: 4
    t.integer  "task_id",              limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id",              limit: 4
    t.integer  "project_id",           limit: 4
    t.integer  "meeting_id",           limit: 4
  end

  add_index "notes", ["meeting_id"], name: "index_notes_on_meeting_id", using: :btree
  add_index "notes", ["note_privacy_type_id"], name: "index_notes_on_note_privacy_type_id", using: :btree
  add_index "notes", ["product_id"], name: "index_notes_on_product_id", using: :btree
  add_index "notes", ["project_id"], name: "index_notes_on_project_id", using: :btree
  add_index "notes", ["sprint_id"], name: "index_notes_on_sprint_id", using: :btree
  add_index "notes", ["story_id"], name: "index_notes_on_story_id", using: :btree
  add_index "notes", ["task_id"], name: "index_notes_on_task_id", using: :btree
  add_index "notes", ["title", "body"], name: "notes_ft_idx", type: :fulltext
  add_index "notes", ["user_id"], name: "index_notes_on_user_id", using: :btree

  create_table "organizations", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  create_table "product_status_types", force: :cascade do |t|
    t.boolean  "alive",       limit: 1
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code",        limit: 255,   default: "FIXME", null: false
  end

  create_table "products", force: :cascade do |t|
    t.boolean  "alive",                  limit: 1
    t.string   "title",                  limit: 255
    t.text     "description",            limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "owner_id",               limit: 4,     default: 1,     null: false
    t.integer  "product_status_type_id", limit: 4,     default: 1,     null: false
    t.boolean  "public",                 limit: 1,     default: false, null: false
  end

  create_table "project_assignments", force: :cascade do |t|
    t.integer  "project_id", limit: 4
    t.integer  "user_id",    limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
  end

  add_index "project_assignments", ["project_id"], name: "index_project_assignments_on_project_id", using: :btree
  add_index "project_assignments", ["user_id"], name: "index_project_assignments_on_user_id", using: :btree

  create_table "project_comments", force: :cascade do |t|
    t.integer  "user_id",    limit: 4
    t.integer  "project_id", limit: 4
    t.text     "comment",    limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "project_comments", ["project_id"], name: "index_project_comments_on_project_id", using: :btree
  add_index "project_comments", ["user_id"], name: "index_project_comments_on_user_id", using: :btree

  create_table "project_status_types", force: :cascade do |t|
    t.string   "title",            limit: 255,                  null: false
    t.boolean  "alive",            limit: 1,     default: true, null: false
    t.text     "description",      limit: 65535
    t.datetime "created_at",                                    null: false
    t.datetime "updated_at",                                    null: false
    t.string   "code",             limit: 255
    t.string   "background_color", limit: 255
    t.string   "text_color",       limit: 255
  end

  create_table "projects", force: :cascade do |t|
    t.string   "title",                  limit: 255,   default: "", null: false
    t.text     "description",            limit: 65535
    t.integer  "creator_id",             limit: 4,     default: 1,  null: false
    t.integer  "owner_id",               limit: 4,     default: 1,  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "project_status_type_id", limit: 4,     default: 1,  null: false
    t.date     "sched_start_date"
    t.date     "actual_start_date"
    t.date     "sched_completion_date"
    t.date     "actual_completion_date"
    t.integer  "product_id",             limit: 4
    t.string   "short_title",            limit: 10,                 null: false
  end

  add_index "projects", ["creator_id"], name: "index_projects_on_creator_id", using: :btree
  add_index "projects", ["owner_id"], name: "index_projects_on_owner_id", using: :btree
  add_index "projects", ["product_id"], name: "index_projects_on_product_id", using: :btree
  add_index "projects", ["project_status_type_id"], name: "index_projects_on_project_status_type_id", using: :btree

  create_table "slas", force: :cascade do |t|
    t.string   "name",              limit: 255
    t.text     "description",       limit: 65535
    t.integer  "product_id",        limit: 4
    t.integer  "response_due_at",   limit: 4
    t.integer  "workaround_due_at", limit: 4
    t.integer  "solution_due_at",   limit: 4
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
  end

  add_index "slas", ["product_id"], name: "index_slas_on_product_id", using: :btree

  create_table "sprint_status_types", force: :cascade do |t|
    t.boolean  "alive",       limit: 1
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code",        limit: 255,   default: "FIXME", null: false
  end

  create_table "sprints", force: :cascade do |t|
    t.date     "start_date"
    t.date     "end_date"
    t.boolean  "alive",                 limit: 1
    t.text     "notes",                 limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sprint_status_type_id", limit: 4
  end

  add_index "sprints", ["sprint_status_type_id"], name: "index_sprints_on_sprint_status_type_id", using: :btree

  create_table "stories", force: :cascade do |t|
    t.boolean  "alive",                limit: 1
    t.string   "title",                limit: 255
    t.text     "description",          limit: 65535
    t.integer  "product_id",           limit: 4
    t.integer  "sprint_id",            limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "story_status_type_id", limit: 4
    t.integer  "requestor_id",         limit: 4
    t.text     "completion_notes",     limit: 65535
    t.decimal  "estimated_hours",                    precision: 10, scale: 2
    t.decimal  "points",                             precision: 10, scale: 2
    t.integer  "creator_id",           limit: 4
    t.integer  "story_type_id",        limit: 4
  end

  add_index "stories", ["product_id"], name: "index_stories_on_product_id", using: :btree
  add_index "stories", ["sprint_id"], name: "index_stories_on_sprint_id", using: :btree
  add_index "stories", ["story_status_type_id"], name: "index_stories_on_story_status_type_id", using: :btree
  add_index "stories", ["story_type_id"], name: "index_stories_on_story_type_id", using: :btree
  add_index "stories", ["title", "description"], name: "stories_ft_idx", type: :fulltext

  create_table "story_assignments", force: :cascade do |t|
    t.integer  "story_id",   limit: 4
    t.integer  "user_id",    limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "story_assignments", ["story_id"], name: "index_story_assignments_on_story_id", using: :btree
  add_index "story_assignments", ["user_id"], name: "index_story_assignments_on_user_id", using: :btree

  create_table "story_status_types", force: :cascade do |t|
    t.boolean  "alive",       limit: 1
    t.string   "title",       limit: 255
    t.string   "code",        limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "story_types", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "task_assignments", force: :cascade do |t|
    t.integer  "task_id",    limit: 4
    t.integer  "user_id",    limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "task_assignments", ["task_id"], name: "index_task_assignments_on_task_id", using: :btree
  add_index "task_assignments", ["user_id"], name: "index_task_assignments_on_user_id", using: :btree

  create_table "task_comment_types", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "task_comments", force: :cascade do |t|
    t.decimal  "hours",                      precision: 5, scale: 2
    t.date     "date_of_work"
    t.text     "comment",      limit: 65535
    t.integer  "task_id",      limit: 4
    t.integer  "user_id",      limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "task_comments", ["task_id"], name: "index_task_comments_on_task_id", using: :btree
  add_index "task_comments", ["user_id"], name: "index_task_comments_on_user_id", using: :btree

  create_table "task_status_types", force: :cascade do |t|
    t.boolean  "alive",       limit: 1
    t.string   "title",       limit: 255
    t.string   "code",        limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "task_types", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "tasks", force: :cascade do |t|
    t.boolean  "alive",                  limit: 1
    t.string   "title",                  limit: 255
    t.text     "description",            limit: 65535
    t.integer  "product_id",             limit: 4
    t.integer  "sprint_id",              limit: 4
    t.integer  "story_id",               limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "task_status_type_id",    limit: 4
    t.decimal  "estimated_hours",                      precision: 5, scale: 2
    t.integer  "task_type_id",           limit: 4
    t.date     "sched_start_date"
    t.date     "actual_start_date"
    t.date     "sched_completion_date"
    t.date     "actual_completion_date"
    t.integer  "project_id",             limit: 4
  end

  add_index "tasks", ["product_id"], name: "index_tasks_on_product_id", using: :btree
  add_index "tasks", ["project_id"], name: "index_tasks_on_project_id", using: :btree
  add_index "tasks", ["sprint_id"], name: "index_tasks_on_sprint_id", using: :btree
  add_index "tasks", ["story_id"], name: "index_tasks_on_story_id", using: :btree
  add_index "tasks", ["task_status_type_id"], name: "index_tasks_on_task_status_type_id", using: :btree
  add_index "tasks", ["task_type_id"], name: "index_tasks_on_task_type_id", using: :btree
  add_index "tasks", ["title", "description"], name: "tasks_ft_idx", type: :fulltext

  create_table "users", force: :cascade do |t|
    t.string   "username",                limit: 255
    t.string   "password_digest",         limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "first_name",              limit: 255
    t.string   "last_name",               limit: 255
    t.string   "office_phone",            limit: 255
    t.string   "contact_email",           limit: 255,                null: false
    t.string   "mobile_phone",            limit: 255
    t.integer  "email_to_sms_gateway_id", limit: 4
    t.boolean  "active",                  limit: 1,   default: true, null: false
  end

  add_index "users", ["email_to_sms_gateway_id"], name: "index_users_on_email_to_sms_gateway_id", using: :btree

  create_table "wiki_pages", force: :cascade do |t|
    t.string   "title",      limit: 255
    t.text     "body",       limit: 65535
    t.integer  "version",    limit: 4
    t.integer  "wiki_id",    limit: 4,     null: false
    t.integer  "product_id", limit: 4
    t.integer  "story_id",   limit: 4
    t.integer  "task_id",    limit: 4
    t.integer  "user_id",    limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "wiki_pages", ["product_id"], name: "index_wiki_pages_on_product_id", using: :btree
  add_index "wiki_pages", ["story_id"], name: "index_wiki_pages_on_story_id", using: :btree
  add_index "wiki_pages", ["task_id"], name: "index_wiki_pages_on_task_id", using: :btree
  add_index "wiki_pages", ["user_id"], name: "index_wiki_pages_on_user_id", using: :btree
  add_index "wiki_pages", ["wiki_id"], name: "index_wiki_pages_on_wiki_id", using: :btree

  create_table "wikis", force: :cascade do |t|
    t.string   "title",         limit: 255
    t.text     "description",   limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "product_id",    limit: 4
    t.integer  "start_page_id", limit: 4
    t.integer  "creator_id",    limit: 4
  end

  add_index "wikis", ["product_id"], name: "index_wikis_on_product_id", using: :btree

  add_foreign_key "meeting_assignments", "meetings"
  add_foreign_key "meeting_assignments", "users"
  add_foreign_key "project_assignments", "projects"
  add_foreign_key "project_assignments", "users"
  add_foreign_key "project_comments", "projects"
  add_foreign_key "project_comments", "users"
  add_foreign_key "users", "email_to_sms_gateways"
end
