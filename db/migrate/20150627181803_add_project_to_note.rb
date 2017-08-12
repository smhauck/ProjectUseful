class AddProjectToNote < ActiveRecord::Migration[4.2]
  def change
    add_reference :notes, :project, index: true
  end
end
