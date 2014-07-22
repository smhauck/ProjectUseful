class Story < ActiveRecord::Base
  belongs_to :product
  belongs_to :sprint
  belongs_to :status, class_name: "StoryStatusType", foreign_key: "story_status_type_id"
  belongs_to :requestor, class_name: "User", foreign_key: "requestor_id"
  has_many :tasks
end
