class Sprint < ActiveRecord::Base
  has_many :stories
  belongs_to :product
  belongs_to :status, class_name: "SprintStatusType", foreign_key: "sprint_status_type_id"
end
