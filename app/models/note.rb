class Note < ActiveRecord::Base
  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :product
  belongs_to :sprint
  belongs_to :story
  belongs_to :task
  belongs_to :privacy, class_name: "NotePrivacyType", foreign_key: "note_privacy_type_id"
end
