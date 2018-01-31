class AddDatesToStories < ActiveRecord::Migration[5.1]
  def change
    add_column :stories, :sched_start_date, :date
    add_column :stories, :actual_start_date, :date
    add_column :stories, :sched_completion_date, :date
    add_column :stories, :actual_completion_date, :date
  end
end
