class AddMeetingToNote < ActiveRecord::Migration
  def change
    add_reference :notes, :meeting, index: true
  end
end
