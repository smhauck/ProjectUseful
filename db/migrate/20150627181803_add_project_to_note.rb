class AddProjectToNote < ActiveRecord::Migration
  def change
    add_reference :notes, :project, index: true
  end
end
