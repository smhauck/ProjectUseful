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

ActiveRecord::Schema.define(version: 20140717061951) do

  create_table "product_status_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "products", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "project_status_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "projects", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.integer  "product_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "projects", ["product_id"], name: "index_projects_on_product_id", using: :btree

  create_table "sprint_status_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sprints", force: true do |t|
    t.date     "start_date"
    t.date     "end_date"
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.integer  "product_id"
    t.integer  "project_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sprints", ["product_id"], name: "index_sprints_on_product_id", using: :btree
  add_index "sprints", ["project_id"], name: "index_sprints_on_project_id", using: :btree

  create_table "stories", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.integer  "product_id"
    t.integer  "project_id"
    t.integer  "sprint_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "stories", ["product_id"], name: "index_stories_on_product_id", using: :btree
  add_index "stories", ["project_id"], name: "index_stories_on_project_id", using: :btree
  add_index "stories", ["sprint_id"], name: "index_stories_on_sprint_id", using: :btree

  create_table "story_status_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "task_status_types", force: true do |t|
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
    t.integer  "project_id"
    t.integer  "sprint_id"
    t.integer  "story_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tasks", ["product_id"], name: "index_tasks_on_product_id", using: :btree
  add_index "tasks", ["project_id"], name: "index_tasks_on_project_id", using: :btree
  add_index "tasks", ["sprint_id"], name: "index_tasks_on_sprint_id", using: :btree
  add_index "tasks", ["story_id"], name: "index_tasks_on_story_id", using: :btree

  create_table "users", force: true do |t|
    t.string   "username"
    t.string   "password_digest"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "wiki_pages", force: true do |t|
    t.string   "title"
    t.text     "body"
    t.integer  "version"
    t.integer  "wiki_id",    default: 2, null: false
    t.integer  "product_id"
    t.integer  "project_id"
    t.integer  "story_id"
    t.integer  "task_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "wiki_pages", ["product_id"], name: "index_wiki_pages_on_product_id", using: :btree
  add_index "wiki_pages", ["project_id"], name: "index_wiki_pages_on_project_id", using: :btree
  add_index "wiki_pages", ["story_id"], name: "index_wiki_pages_on_story_id", using: :btree
  add_index "wiki_pages", ["task_id"], name: "index_wiki_pages_on_task_id", using: :btree
  add_index "wiki_pages", ["user_id"], name: "index_wiki_pages_on_user_id", using: :btree
  add_index "wiki_pages", ["wiki_id"], name: "index_wiki_pages_on_wiki_id", using: :btree

  create_table "wikis", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
