class AddCodeToStoryStatusType < ActiveRecord::Migration
  def change
    add_column :story_status_types, :code, :string
  end
end
