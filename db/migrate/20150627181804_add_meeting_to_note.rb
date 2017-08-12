class AddMeetingToNote < ActiveRecord::Migration[4.2]
  def change
    add_reference :notes, :meeting, index: true
  end
end
