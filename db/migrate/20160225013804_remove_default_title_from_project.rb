class RemoveDefaultTitleFromProject < ActiveRecord::Migration
  def up
    change_column_null :projects, :title, false
    change_column_default :projects, :title, ''
  end
  def down
    change_column_null :projects, :title, false
    change_column_default :projects, :title, ''
  end
end
