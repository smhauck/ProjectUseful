class AddProductAndProjectToMeetings < ActiveRecord::Migration
  def change
    add_reference :meetings, :product, index: true
    add_reference :meetings, :project, index: true
  end
end
