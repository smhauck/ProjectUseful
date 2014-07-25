class Sprint < ActiveRecord::Base
  has_many :stories
  belongs_to :product
  belongs_to :status, class_name: "SprintStatusType", foreign_key: "sprint_status_type_id"
  def title
    "#{start_date} - #{end_date}"
  end
end
