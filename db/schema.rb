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

ActiveRecord::Schema.define(version: 20140807051421) do

  create_table "blog_posts", force: true do |t|
    t.string   "title"
    t.text     "body"
    t.date     "publish_date"
    t.integer  "blog_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "blog_posts", ["blog_id"], name: "index_blog_posts_on_blog_id", using: :btree
  add_index "blog_posts", ["user_id"], name: "index_blog_posts_on_user_id", using: :btree

  create_table "blogs", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "creator_id"
  end

  create_table "issue_status_types", force: true do |t|
    t.string   "title"
    t.string   "code"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "alive"
  end

  create_table "issue_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code"
  end

  create_table "issues", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.integer  "requestor_id"
    t.integer  "product_id"
    t.integer  "issue_status_type_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "submitter_email"
    t.string   "submitter_full_name"
    t.integer  "issue_type_id"
    t.boolean  "accepted"
    t.integer  "story_id"
  end

  add_index "issues", ["issue_status_type_id"], name: "index_issues_on_issue_status_type_id", using: :btree
  add_index "issues", ["issue_type_id"], name: "index_issues_on_issue_type_id", using: :btree
  add_index "issues", ["product_id"], name: "index_issues_on_product_id", using: :btree
  add_index "issues", ["story_id"], name: "index_issues_on_story_id", using: :btree

  create_table "note_privacy_types", force: true do |t|
    t.string   "title"
    t.string   "code"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "notes", force: true do |t|
    t.string   "title"
    t.text     "body"
    t.integer  "creator_id"
    t.integer  "note_privacy_type_id", default: 1, null: false
    t.integer  "product_id"
    t.integer  "sprint_id"
    t.integer  "story_id"
    t.integer  "task_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id"
  end

  add_index "notes", ["note_privacy_type_id"], name: "index_notes_on_note_privacy_type_id", using: :btree
  add_index "notes", ["product_id"], name: "index_notes_on_product_id", using: :btree
  add_index "notes", ["sprint_id"], name: "index_notes_on_sprint_id", using: :btree
  add_index "notes", ["story_id"], name: "index_notes_on_story_id", using: :btree
  add_index "notes", ["task_id"], name: "index_notes_on_task_id", using: :btree
  add_index "notes", ["user_id"], name: "index_notes_on_user_id", using: :btree

  create_table "product_status_types", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code",        default: "FIXME", null: false
  end

  create_table "products", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "owner_id",               default: 1, null: false
    t.integer  "product_status_type_id", default: 1, null: false
  end

  create_table "sprint_status_types", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code",        default: "FIXME", null: false
  end

  create_table "sprints", force: true do |t|
    t.date     "start_date"
    t.date     "end_date"
    t.boolean  "alive"
    t.text     "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sprint_status_type_id"
  end

  add_index "sprints", ["sprint_status_type_id"], name: "index_sprints_on_sprint_status_type_id", using: :btree

  create_table "stories", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.integer  "product_id"
    t.integer  "sprint_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "story_status_type_id"
    t.integer  "requestor_id"
    t.text     "completion_notes"
    t.decimal  "estimated_hours",      precision: 10, scale: 2
    t.decimal  "points",               precision: 10, scale: 2
    t.integer  "creator_id"
    t.integer  "story_type_id"
  end

  add_index "stories", ["product_id"], name: "index_stories_on_product_id", using: :btree
  add_index "stories", ["sprint_id"], name: "index_stories_on_sprint_id", using: :btree
  add_index "stories", ["story_status_type_id"], name: "index_stories_on_story_status_type_id", using: :btree
  add_index "stories", ["story_type_id"], name: "index_stories_on_story_type_id", using: :btree

  create_table "story_assignments", force: true do |t|
    t.integer  "story_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "story_assignments", ["story_id"], name: "index_story_assignments_on_story_id", using: :btree
  add_index "story_assignments", ["user_id"], name: "index_story_assignments_on_user_id", using: :btree

  create_table "story_status_types", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.string   "code"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "story_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "task_assignments", force: true do |t|
    t.integer  "task_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "task_assignments", ["task_id"], name: "index_task_assignments_on_task_id", using: :btree
  add_index "task_assignments", ["user_id"], name: "index_task_assignments_on_user_id", using: :btree

  create_table "task_comment_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "task_comments", force: true do |t|
    t.decimal  "hours",        precision: 5, scale: 2
    t.date     "date_of_work"
    t.text     "comment"
    t.integer  "task_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "task_comments", ["task_id"], name: "index_task_comments_on_task_id", using: :btree
  add_index "task_comments", ["user_id"], name: "index_task_comments_on_user_id", using: :btree

  create_table "task_status_types", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.string   "code"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "task_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "tasks", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.integer  "product_id"
    t.integer  "sprint_id"
    t.integer  "story_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "task_status_type_id"
    t.decimal  "estimated_hours",     precision: 5, scale: 2
    t.integer  "task_type_id"
  end

  add_index "tasks", ["product_id"], name: "index_tasks_on_product_id", using: :btree
  add_index "tasks", ["sprint_id"], name: "index_tasks_on_sprint_id", using: :btree
  add_index "tasks", ["story_id"], name: "index_tasks_on_story_id", using: :btree
  add_index "tasks", ["task_status_type_id"], name: "index_tasks_on_task_status_type_id", using: :btree
  add_index "tasks", ["task_type_id"], name: "index_tasks_on_task_type_id", using: :btree

  create_table "users", force: true do |t|
    t.string   "username"
    t.string   "password_digest"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "contact_phone"
    t.string   "contact_email",   null: false
  end

  create_table "wiki_pages", force: true do |t|
    t.string   "title"
    t.text     "body"
    t.integer  "version"
    t.integer  "wiki_id",    null: false
    t.integer  "product_id"
    t.integer  "story_id"
    t.integer  "task_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "wiki_pages", ["product_id"], name: "index_wiki_pages_on_product_id", using: :btree
  add_index "wiki_pages", ["story_id"], name: "index_wiki_pages_on_story_id", using: :btree
  add_index "wiki_pages", ["task_id"], name: "index_wiki_pages_on_task_id", using: :btree
  add_index "wiki_pages", ["user_id"], name: "index_wiki_pages_on_user_id", using: :btree
  add_index "wiki_pages", ["wiki_id"], name: "index_wiki_pages_on_wiki_id", using: :btree

  create_table "wikis", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "product_id"
    t.integer  "start_page_id"
    t.integer  "creator_id"
  end

  add_index "wikis", ["product_id"], name: "index_wikis_on_product_id", using: :btree

end
