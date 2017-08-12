class CreateMeetingAssignments < ActiveRecord::Migration[4.2]
  def change
    create_table :meeting_assignments do |t|
      t.references :meeting, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
