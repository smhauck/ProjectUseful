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

ActiveRecord::Schema.define(version: 20140717004757) do

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
    t.integer  "Product_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "projects", ["Product_id"], name: "index_projects_on_Product_id"

  create_table "sprint_status_types", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sprints", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.integer  "Product_id"
    t.integer  "Project_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sprints", ["Product_id"], name: "index_sprints_on_Product_id"
  add_index "sprints", ["Project_id"], name: "index_sprints_on_Project_id"

  create_table "stories", force: true do |t|
    t.boolean  "alive"
    t.string   "title"
    t.text     "description"
    t.integer  "Product_id"
    t.integer  "Project_id"
    t.integer  "Sprint_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "stories", ["Product_id"], name: "index_stories_on_Product_id"
  add_index "stories", ["Project_id"], name: "index_stories_on_Project_id"
  add_index "stories", ["Sprint_id"], name: "index_stories_on_Sprint_id"

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
    t.integer  "Product_id"
    t.integer  "Project_id"
    t.integer  "Sprint_id"
    t.integer  "Story_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tasks", ["Product_id"], name: "index_tasks_on_Product_id"
  add_index "tasks", ["Project_id"], name: "index_tasks_on_Project_id"
  add_index "tasks", ["Sprint_id"], name: "index_tasks_on_Sprint_id"
  add_index "tasks", ["Story_id"], name: "index_tasks_on_Story_id"

  create_table "users", force: true do |t|
    t.string   "username"
    t.string   "password_digest"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "wikis", force: true do |t|
    t.string   "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
