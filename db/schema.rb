# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_04_25_204028) do
  create_table "action_text_rich_texts", force: :cascade do |t|
    t.string "name", null: false
    t.text "body"
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "blog_posts", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.date "publish_date"
    t.integer "blog_id"
    t.integer "user_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["blog_id"], name: "index_blog_posts_on_blog_id"
    t.index ["user_id"], name: "index_blog_posts_on_user_id"
  end

  create_table "blogs", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "creator_id"
  end

  create_table "contact_emails", force: :cascade do |t|
    t.string "address"
    t.integer "contact_id"
    t.integer "email_type_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["contact_id"], name: "index_contact_emails_on_contact_id"
    t.index ["email_type_id"], name: "index_contact_emails_on_email_type_id"
  end

  create_table "contacts", force: :cascade do |t|
    t.string "first_name"
    t.string "middle_name"
    t.string "last_name"
    t.string "prefix"
    t.string "suffix"
    t.integer "sex_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["sex_id"], name: "index_contacts_on_sex_id"
  end

  create_table "departments", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "email_to_sms_gateways", force: :cascade do |t|
    t.string "name", null: false
    t.string "address", null: false
    t.text "description"
    t.boolean "active", default: true, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "email_types", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "issue_status_types", force: :cascade do |t|
    t.string "title"
    t.string "code"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.boolean "alive"
  end

  create_table "issue_types", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "code"
  end

  create_table "issues", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.integer "requestor_id"
    t.integer "product_id"
    t.integer "issue_status_type_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "submitter_email"
    t.string "submitter_full_name"
    t.integer "issue_type_id"
    t.boolean "accepted"
    t.integer "story_id"
    t.string "vendor_case_id"
    t.string "vendor_issue_id"
    t.datetime "reported_to_vendor_at", precision: nil
    t.integer "slas_id"
    t.datetime "vendor_response_due_at", precision: nil
    t.datetime "vendor_response_actual_at", precision: nil
    t.datetime "vendor_workaround_due_at", precision: nil
    t.datetime "vendor_workaround_actual_at", precision: nil
    t.datetime "vendor_solution_due_at", precision: nil
    t.datetime "vendor_solution_actual_at", precision: nil
    t.text "impact"
    t.index ["issue_status_type_id"], name: "index_issues_on_issue_status_type_id"
    t.index ["issue_type_id"], name: "index_issues_on_issue_type_id"
    t.index ["product_id"], name: "index_issues_on_product_id"
    t.index ["slas_id"], name: "index_issues_on_slas_id"
    t.index ["story_id"], name: "index_issues_on_story_id"
  end

  create_table "meeting_assignments", force: :cascade do |t|
    t.integer "meeting_id"
    t.integer "user_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["meeting_id"], name: "index_meeting_assignments_on_meeting_id"
    t.index ["user_id"], name: "index_meeting_assignments_on_user_id"
  end

  create_table "meetings", force: :cascade do |t|
    t.datetime "scheduled", precision: nil
    t.string "title"
    t.string "subject"
    t.text "description"
    t.text "notes"
    t.integer "creator_id"
    t.integer "owner_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "product_id"
    t.integer "project_id"
    t.index ["creator_id"], name: "index_meetings_on_creator_id"
    t.index ["owner_id"], name: "index_meetings_on_owner_id"
    t.index ["product_id"], name: "index_meetings_on_product_id"
    t.index ["project_id"], name: "index_meetings_on_project_id"
  end

  create_table "note_privacy_types", force: :cascade do |t|
    t.string "title"
    t.string "code"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "notes", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.integer "creator_id"
    t.integer "note_privacy_type_id", default: 1, null: false
    t.integer "product_id"
    t.integer "sprint_id"
    t.integer "story_id"
    t.integer "task_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "user_id"
    t.integer "project_id"
    t.integer "meeting_id"
    t.index ["meeting_id"], name: "index_notes_on_meeting_id"
    t.index ["note_privacy_type_id"], name: "index_notes_on_note_privacy_type_id"
    t.index ["product_id"], name: "index_notes_on_product_id"
    t.index ["project_id"], name: "index_notes_on_project_id"
    t.index ["sprint_id"], name: "index_notes_on_sprint_id"
    t.index ["story_id"], name: "index_notes_on_story_id"
    t.index ["task_id"], name: "index_notes_on_task_id"
    t.index ["user_id"], name: "index_notes_on_user_id"
  end

  create_table "organizations", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "product_status_types", force: :cascade do |t|
    t.boolean "alive"
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "code", default: "FIXME", null: false
  end

  create_table "products", force: :cascade do |t|
    t.boolean "alive"
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "owner_id", default: 1, null: false
    t.integer "product_status_type_id", default: 1, null: false
    t.boolean "public", default: false, null: false
  end

  create_table "project_assignments", force: :cascade do |t|
    t.integer "project_id"
    t.integer "user_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["project_id"], name: "index_project_assignments_on_project_id"
    t.index ["user_id"], name: "index_project_assignments_on_user_id"
  end

  create_table "project_comments", force: :cascade do |t|
    t.integer "user_id"
    t.integer "project_id"
    t.text "comment"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["project_id"], name: "index_project_comments_on_project_id"
    t.index ["user_id"], name: "index_project_comments_on_user_id"
  end

  create_table "project_status_types", force: :cascade do |t|
    t.string "title", null: false
    t.boolean "alive", default: true, null: false
    t.text "description"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "code"
    t.string "background_color"
    t.string "text_color"
  end

  create_table "projects", force: :cascade do |t|
    t.string "title", default: "", null: false
    t.text "description"
    t.integer "creator_id", default: 1, null: false
    t.integer "owner_id", default: 1, null: false
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "project_status_type_id", default: 1, null: false
    t.date "sched_start_date"
    t.date "actual_start_date"
    t.date "sched_completion_date"
    t.date "actual_completion_date"
    t.integer "product_id"
    t.string "short_title", limit: 15, null: false
    t.index ["creator_id"], name: "index_projects_on_creator_id"
    t.index ["owner_id"], name: "index_projects_on_owner_id"
    t.index ["product_id"], name: "index_projects_on_product_id"
    t.index ["project_status_type_id"], name: "index_projects_on_project_status_type_id"
  end

  create_table "sexes", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.boolean "active"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "slas", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.integer "product_id"
    t.integer "response_due_at"
    t.integer "workaround_due_at"
    t.integer "solution_due_at"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["product_id"], name: "index_slas_on_product_id"
  end

  create_table "sprint_status_types", force: :cascade do |t|
    t.boolean "alive"
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "code", default: "FIXME", null: false
  end

  create_table "sprints", force: :cascade do |t|
    t.date "start_date"
    t.date "end_date"
    t.boolean "alive"
    t.text "notes"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "sprint_status_type_id"
    t.index ["sprint_status_type_id"], name: "index_sprints_on_sprint_status_type_id"
  end

  create_table "stories", force: :cascade do |t|
    t.boolean "alive"
    t.string "title"
    t.text "description"
    t.integer "product_id"
    t.integer "sprint_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "story_status_type_id"
    t.integer "requestor_id"
    t.text "completion_notes"
    t.decimal "estimated_hours", precision: 10, scale: 2
    t.decimal "points", precision: 10, scale: 2
    t.integer "creator_id"
    t.integer "story_type_id"
    t.integer "project_id"
    t.date "sched_start_date"
    t.date "actual_start_date"
    t.date "sched_completion_date"
    t.date "actual_completion_date"
    t.index ["product_id"], name: "index_stories_on_product_id"
    t.index ["project_id"], name: "index_stories_on_project_id"
    t.index ["sprint_id"], name: "index_stories_on_sprint_id"
    t.index ["story_status_type_id"], name: "index_stories_on_story_status_type_id"
    t.index ["story_type_id"], name: "index_stories_on_story_type_id"
  end

  create_table "story_assignments", force: :cascade do |t|
    t.integer "story_id"
    t.integer "user_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["story_id"], name: "index_story_assignments_on_story_id"
    t.index ["user_id"], name: "index_story_assignments_on_user_id"
  end

  create_table "story_status_types", force: :cascade do |t|
    t.boolean "alive"
    t.string "title"
    t.string "code"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "story_types", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "task_assignments", force: :cascade do |t|
    t.integer "task_id"
    t.integer "user_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["task_id"], name: "index_task_assignments_on_task_id"
    t.index ["user_id"], name: "index_task_assignments_on_user_id"
  end

  create_table "task_comment_types", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "task_comments", force: :cascade do |t|
    t.decimal "hours", precision: 5, scale: 2
    t.date "date_of_work"
    t.text "comment"
    t.integer "task_id"
    t.integer "user_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["task_id"], name: "index_task_comments_on_task_id"
    t.index ["user_id"], name: "index_task_comments_on_user_id"
  end

  create_table "task_status_types", force: :cascade do |t|
    t.boolean "alive"
    t.string "title"
    t.string "code"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "task_types", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "tasks", force: :cascade do |t|
    t.boolean "alive"
    t.string "title"
    t.text "description"
    t.integer "product_id"
    t.integer "sprint_id"
    t.integer "story_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "task_status_type_id"
    t.decimal "estimated_hours", precision: 5, scale: 2
    t.integer "task_type_id"
    t.date "sched_start_date"
    t.date "actual_start_date"
    t.date "sched_completion_date"
    t.date "actual_completion_date"
    t.integer "project_id"
    t.index ["product_id"], name: "index_tasks_on_product_id"
    t.index ["project_id"], name: "index_tasks_on_project_id"
    t.index ["sprint_id"], name: "index_tasks_on_sprint_id"
    t.index ["story_id"], name: "index_tasks_on_story_id"
    t.index ["task_status_type_id"], name: "index_tasks_on_task_status_type_id"
    t.index ["task_type_id"], name: "index_tasks_on_task_type_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "password_digest"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "first_name"
    t.string "last_name"
    t.string "office_phone"
    t.string "contact_email", null: false
    t.string "mobile_phone"
    t.integer "email_to_sms_gateway_id"
    t.boolean "active", default: true, null: false
    t.string "nick_name"
    t.index ["email_to_sms_gateway_id"], name: "index_users_on_email_to_sms_gateway_id"
  end

  create_table "wiki_pages", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.integer "version"
    t.integer "wiki_id", null: false
    t.integer "product_id"
    t.integer "story_id"
    t.integer "task_id"
    t.integer "user_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["product_id"], name: "index_wiki_pages_on_product_id"
    t.index ["story_id"], name: "index_wiki_pages_on_story_id"
    t.index ["task_id"], name: "index_wiki_pages_on_task_id"
    t.index ["user_id"], name: "index_wiki_pages_on_user_id"
    t.index ["wiki_id"], name: "index_wiki_pages_on_wiki_id"
  end

  create_table "wikis", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "product_id"
    t.integer "start_page_id"
    t.integer "creator_id"
    t.index ["product_id"], name: "index_wikis_on_product_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "contact_emails", "contacts"
  add_foreign_key "contact_emails", "email_types"
  add_foreign_key "contacts", "sexes"
  add_foreign_key "meeting_assignments", "meetings"
  add_foreign_key "meeting_assignments", "users"
  add_foreign_key "project_assignments", "projects"
  add_foreign_key "project_assignments", "users"
  add_foreign_key "project_comments", "projects"
  add_foreign_key "project_comments", "users"
  add_foreign_key "stories", "projects"
  add_foreign_key "users", "email_to_sms_gateways"
end
