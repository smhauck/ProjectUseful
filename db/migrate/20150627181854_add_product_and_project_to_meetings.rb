class AddProductAndProjectToMeetings < ActiveRecord::Migration[4.2]
  def change
    add_reference :meetings, :product, index: true
    add_reference :meetings, :project, index: true
  end
end
