class CreateMeetingAssignments < ActiveRecord::Migration
  def change
    create_table :meeting_assignments do |t|
      t.references :meeting, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
