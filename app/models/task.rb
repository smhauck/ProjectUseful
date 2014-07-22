class Task < ActiveRecord::Base
  belongs_to :product
  belongs_to :sprint
  belongs_to :story
  belongs_to :status, class_name: "TaskStatusType", foreign_key: "task_status_type_id"
end
